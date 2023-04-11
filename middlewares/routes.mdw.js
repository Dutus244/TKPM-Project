import authWithRequiredPermission from './auth.mdw.js';
import { getVisiblePage } from "../utils/helper.js";
import learnerRoute from '../routes/learner.route.js';
import adminRoute from '../routes/admin.route.js';
import accountRoute from '../routes/account.route.js';


export default function (app) {
  app.get('/', async (req, res) => {
    res.render('vwGuest/home', {
      
    })
  })


  app.use('/', accountRoute)
  app.use('/', learnerRoute)
  app.use('/admin', adminRoute)
}


