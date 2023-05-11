import authWithRequiredPermission from './auth.mdw.js';
import { getVisiblePage } from "../utils/helper.js";
import learnerRoute from '../routes/learner.route.js';
import adminRoute from '../routes/admin.route.js';
import accountRoute from '../routes/account.route.js';
import { ADMIN_PERMISSION_CODE, LEARNER_PERMISSION_CODE } from '../routes/constants.js';


export default function (app) {
  app.get('/', async (req, res) => {
    res.redirect('/revision')
  })

  app.use('/', accountRoute)
  app.use('/admin', authWithRequiredPermission(ADMIN_PERMISSION_CODE), adminRoute)
  app.use('/', authWithRequiredPermission(LEARNER_PERMISSION_CODE), learnerRoute)
}


