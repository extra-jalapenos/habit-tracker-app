import { ExtractRPCFromHandler } from "../backend/types/utility";
import * as globalCheckinsGETHandler from "../backend/router/global\checkins\GET";
import * as globalCheckinsHabitIdStatsGETHandler from "../backend/router/global\checkins\habitId\stats\GET";
import * as globalCheckinsPOSTHandler from "../backend/router/global\checkins\POST";
import * as globalDemoGETHandler from "../backend/router/global\demo\GET";
import * as globalEchoPOSTHandler from "../backend/router/global\echo\POST";
import * as globalHabitsGETHandler from "../backend/router/global\habits\GET";
import * as globalHabitsIdDELETEHandler from "../backend/router/global\habits\id\DELETE";
import * as globalHabitsIdGETHandler from "../backend/router/global\habits\id\GET";
import * as globalHabitsIdPUTHandler from "../backend/router/global\habits\id\PUT";
import * as globalHabitsPOSTHandler from "../backend/router/global\habits\POST";
import * as issueDetailsGETHandler from "../backend/router/issue\details\GET";
import * as projectDemoGETHandler from "../backend/router/project\demo\GET";

export type ApiRouter = {
    global: {
        checkins: {
            GET: ExtractRPCFromHandler<globalCheckinsGETHandler.Handle>;
            habitId: {
                stats: {
                    GET: ExtractRPCFromHandler<globalCheckinsHabitIdStatsGETHandler.Handle>;
                };
            };
            POST: ExtractRPCFromHandler<globalCheckinsPOSTHandler.Handle>;
        };
        demo: {
            GET: ExtractRPCFromHandler<globalDemoGETHandler.Handle>;
        };
        echo: {
            POST: ExtractRPCFromHandler<globalEchoPOSTHandler.Handle>;
        };
        habits: {
            GET: ExtractRPCFromHandler<globalHabitsGETHandler.Handle>;
            id: {
                DELETE: ExtractRPCFromHandler<globalHabitsIdDELETEHandler.Handle>;
                GET: ExtractRPCFromHandler<globalHabitsIdGETHandler.Handle>;
                PUT: ExtractRPCFromHandler<globalHabitsIdPUTHandler.Handle>;
            };
            POST: ExtractRPCFromHandler<globalHabitsPOSTHandler.Handle>;
        };
    };
    issue: {
        details: {
            GET: ExtractRPCFromHandler<issueDetailsGETHandler.Handle>;
        };
    };
    project: {
        demo: {
            GET: ExtractRPCFromHandler<projectDemoGETHandler.Handle>;
        };
    };
};
