import authWithRequiredPermission from './auth.mdw.js';
import { getVisiblePage } from "../utils/helper.js";
import adminRoute from '../routes/admin.route.js'

export default function (app) {
  app.get('/', async (req, res) => {
    res.render('vwGuest/home', {
      
    })
  })

  app.use('/admin', adminRoute)
}


