import authWithRequiredPermission from './auth.mdw.js';
import { getVisiblePage } from "../utils/helper.js";
import userRouter from '../routes/user.route.js'
export default function (app) {
  app.get('/', async (req, res) => {
    res.render('vwGuest/home', {
      
    })
  })
  app.use('/user', userRouter)
}
