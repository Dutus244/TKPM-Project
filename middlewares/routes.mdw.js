import authWithRequiredPermission from './auth.mdw.js';
import { getVisiblePage } from "../utils/helper.js";

export default function (app) {
  app.get('/', async (req, res) => {
    res.render('vwGuest/home', {
      
    })
  })
}
