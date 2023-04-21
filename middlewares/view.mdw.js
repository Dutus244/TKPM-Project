import { engine } from "express-handlebars";
import hbs_sections from "express-handlebars-sections";
import numeral from "numeral";
import moment from "moment";

export default function (app, __dirname) {
  app.engine(
    "hbs",
    engine({
      extname: "hbs",
      defaultLayout: "main.hbs",
      helpers: {
        section: hbs_sections(),
        format_number(val) {
          return numeral(val).format("0,0");
        },
        ifEquals: function (v1, v2, options) {
          if (v1 === v2) {
            return options.fn(this);
          }
          return options.inverse(this);
        },
        ifCompare: function (v1, v2, options) {
          if (v1 > v2) {
            return options.fn(this);
          }
          return options.inverse(this);
        },
        format_date_ddmmyyyy(val) {
          if (val) return moment(val).format("DD-MM-YYYY");
          else return null;
        },
        shuffleArray: function (array) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        },
        json: function(context) {
          return JSON.stringify(context);
        },
      },
    })
  );
  app.set("view engine", "hbs");
  app.set("views", __dirname + "/views");
}
