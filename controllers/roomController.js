import RoomManager from '../utils/room.js';
import { writeFileSync } from 'fs';

export default class roomController {

    static async removeSession(req, res) {
        if(req.session) {
            req.session.destroy();
            return res.status(200).json({ status:1, reason:"successfully deleted session" });
        } else {
            return res.status(401).json({ status:0, reason:"not authorized to delete session" });
        }
    }

    static async createRoom(req, res) {
        if (!req?.body) return res.status(400).json({ status: "failed", reason: "Invalid request body" });

        const { roomName, picture, description, admin } = req.body;

        let filePath;
        if (false && picture?.startsWith('data:image') && picture.includes(';base64,')) {
            const fileType = picture.split(';')[0].split('/')[1];
            const base64Data = picture.replace(/^data:image\/\w+;base64,/, '');
            filePath = `../../roomPics/${roomName}.${fileType}`;
            writeFileSync(filePath, base64Data, { encoding: 'base64' });
        } else {
            filePath = "../../roomPics/default.jpg";
        }

        const result = await RoomManager.createRoom(roomName, filePath, description, undefined, [admin]);

        if (result.status === "success") {
            return res.json({ status: "success", roomId: result.roomId });
        } else {
            console.error("Error creating room:", result.reason);
            return res.status(400).json({ status: "failed", reason: result.reason });
        }
    }

    static async listRooms(req, res) {
        const rooms = await RoomManager.listRooms();
        return res.json(rooms);
    }

    static async listAdmins(req, res) {
        if (!req.session?.room?.roomName) return res.status(400).json([]);
        const admins = await RoomManager.listAdmins(req.session.room.roomName);
        return res.json(admins);
    }

    static async listMembers(req, res) {
        if (!req.session?.room?.roomName) return res.status(400).json([]);
        const members = await RoomManager.listMembers(req.session.room.roomName);
        return res.json(members);
    }

    static async addAdmin(req, res) {
        const { username, roomName } = req.body || {};
        if (!username || !roomName) return res.status(400).json({ status: "failed", reason: "missing data" });

        const result = await RoomManager.addAdmin(username, roomName);
        if (result.status === "success") return res.json({ status: "success" });
        return res.status(400).json({ status: "failed", reason: result.reason });
    }

    static async removeAdmin(req, res) {
        const { username, roomName } = req.body || {};
        if (!username || !roomName) return res.status(400).json({ status: "failed", reason: "missing data" });

        const result = await RoomManager.removeAdmin(username, roomName);
        if (result.status === "success") return res.json({ status: "success" });
        return res.status(400).json({ status: "failed", reason: result.reason });
    }

    static async addMember(req, res) {
        if (!req.session?.user?.username || !req.session?.room?.roomName)
            return res.status(400).json({ status: "failed", reason: "missing session data" });

        const result = await RoomManager.addMember(req.session.user.username, req.session.room.roomName);
        if (result.status === "success") return res.json({ status: "success" });
        return res.status(400).json({ status: "failed", reason: result.reason });
    }

    static async removeMember(req, res) {
        if (!req.session?.user?.username || !req.session?.room?.roomName)
            return res.status(400).json({ status: "failed", reason: "missing session data" });

        const result = await RoomManager.removeMember(req.session.user.username, req.session.room.roomName);
        if (result.status === "success") return res.json({ status: "success" });
        return res.status(400).json({ status: "failed", reason: result.reason });
    }

    static setRoom(req, res) {
        const roomName = req.query?.roomName;
        if (!req.session?.user || !roomName) return res.status(400).json({ status: "failed" });

        req.session.room = { roomName };
        return res.json({ status: "success" });
    }
}
