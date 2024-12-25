import Express from 'express';
import env from 'process';
import bodyParser from 'body-parser';
import routes from './routes/index'

const app = Express();
const port = env.PORTNUM || 5000;
const host = env.HOSTNAME || '127.0.0.1';

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use('/', routes);

app.listen(port, host, () => {
  console.log('connected successfully!');
})