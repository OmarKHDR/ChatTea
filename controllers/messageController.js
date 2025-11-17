import MessageManager from "../utils/messages.js";
import RoomManager from "../utils/room.js";

export default class messageController {
    static async addMessage(req, res) {
        if (!(req.body && req.body.message && req.session?.room?.roomName && req.session?.user?.username)) {
            return res.status(400).json({ status: "failed", reason: "insufficient data" });
        }

        const room = req.session.room.roomName;
        const user = req.session.user.username;
        const message = req.body.message;
        const time = req.body.timeCreated;

        const result = await MessageManager.addMessage(room, user, message, time);

        if (result.status === "success") {
            return res.status(200).json(result);
        } else {
            console.error("Failed to add message:", result.reason);
            return res.status(500).json(result);
        }
    }

    static async deleteRoomMessages(req, res) {
        if (!req.session?.room?.roomName || !req.session?.user?.username) {
            return res.status(401).json({ status: 0, reason: "not authorized" });
        }

        const room = req.session.room.roomName;
        const username = req.session.user.username;

        const adminsResult = await RoomManager.listAdmins(room);
        if (adminsResult?.status && adminsResult.status !== "success") {
            console.error("Failed to fetch admins:", adminsResult.reason);
            return res.status(500).json({ status: "failed", reason: adminsResult.reason });
        }

        const admins = adminsResult?.admins ?? adminsResult; // depending on RoomManager return
        if (!admins.includes(username)) {
            return res.status(401).json({ status: 0, reason: "you are not an admin of this room" });
        }

        const deletionResult = await MessageManager.deleteAllRoomMessages(room);
        if (deletionResult.status === "success") {
            return res.status(200).json({ status: 1, reason: "successful deletion" });
        } else {
            console.error("Failed to delete room messages:", deletionResult.reason);
            return res.status(500).json({ status: "failed", reason: deletionResult.reason });
        }
    }

    static async getAllMessages(req, res) {
        if (!req.session?.room?.roomName) {
            return res.status(401).json({ status: "failed", reason: "not authorized" });
        }

        const room = req.session.room.roomName;
        const result = await MessageManager.getRoomMessages(room);

        if (result.status === "success") {
            return res.status(200).json(result.messages);
        } else {
            console.error("Failed to get room messages:", result.reason);
            return res.status(500).json({ status: "failed", reason: result.reason });
        }
    }

    static async isAuthenticated(req, res, next) {
        if (req.session?.user && req.session?.room) {
            console.log("authenticated to access messages");
            return next();
        } else {
            console.log("not authenticated user", req.session?.room);
            return res.status(401).json({ status: "failed" });
        }
    }

    static async ownershipCheck(req, res, next) {
        if (!req.session?.user || !req.session?.room) {
            return res.status(401).json({ status: "failed" });
        }

        if (!(req.body && req.body.messageId)) {
            return res.status(400).json({ status: "failed", reason: "messageId required" });
        }

        const userName = req.session.user.username;
        const roomName = req.session.room.roomName;
        const messageResult = await MessageManager.getMessageById(req.body.messageId);

        if (messageResult.status !== "success") {
            console.error("Message ownership check failed:", messageResult.reason);
            return res.status(404).json({ status: "failed", reason: messageResult.reason });
        }

        const messageObj = messageResult.message;

        if (messageObj.userName === userName && messageObj.roomName === roomName) {
            console.log("has permission to edit message");
            return next();
        } else {
            console.log("not the owner");
            return res.status(403).json({ status: "failed", reason: "not the owner of the message" });
        }
    }
}
