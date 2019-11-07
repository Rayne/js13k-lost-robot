/**
 * Mapping pipeline:
 *
 * 1. Build a map in Inkscape (or another SVG program). Tag polygons as collectibles, obstacles or doors
 *
 * 2. Convert the SVG file to a map file with `/bin/svg2map`
 *
 * 3. Copy the result into the `maps` list below
 */

export let maps = [
    '{"start":[158,986],"goal":[1134,491],"doors":[],"obstacles":[[632,329,620,384,590,429,545,460,490,471,435,460,390,429,359,384,348,329,359,274,390,229,435,198,490,187,545,198,590,229,620,274,632,329],[490,644,694,644,942,892,329,892,329,813,14,813,14,1128,329,1128,329,1049,966,1049,966,1128,1281,1128,1281,813,1084,813,844,572],[966,572,966,652,1281,652,1281,336,966,336,966,416,805,416,805,329],[490,644,367,620,267,552,199,452,174,329,199,206,267,106,367,38,490,14,613,38,713,106,780,206,805,329],[1,1,1297,1,1297,1147,1,1147,1,1],[844,572,966,572]],"collectibles":[[703,239,"#e9afaf"],[291,972,"#e9afaf"],[397,972,"#e9afaf"],[503,972,"#e9afaf"],[609,972,"#e9afaf"],[715,972,"#e9afaf"],[820,972,"#e9afaf"],[926,972,"#e9afaf"],[1032,972,"#e9afaf"],[890,490,"#e9afaf"],[80,972,"#e9afaf"],[185,972,"#e9afaf"],[580,115,"#e9afaf"],[400,115,"#e9afaf"],[277,239,"#e9afaf"],[276,417,"#e9afaf"],[401,542,"#e9afaf"]]}',

    '{"start":[258,-549],"goal":[2006,-157],"doors":[[398,-348,460,-413,"#2aff80",true],[1463,291,1481,174,"#55ddff",true],[644,-102,707,-166,"#2aff80",false]],"obstacles":[[76,-868,76,-348,398,-348,644,-102,607,-65,874,455,1451,363,1463,291,1874,291,1874,340,2176,192,1986,43,2176,-104,2176,-252,1874,-252,1874,174,1481,174,1542,-215,1020,-479,707,-166,460,-413,460,-868,76,-868],[762,-258,1051,111,1213,95,1250,-129,1117,-206]],"collectibles":[[258,-686,"#2aff80"],[1102,-27,"#55ddff"],[470,-335,"#e9afaf"],[653,-156,"#e9afaf"],[1545,238,"#e9afaf"],[1931,40,"#e9afaf"],[562,-247,"#2aff80"],[2074,185,"#e9afaf"]]}',

    '{"start":[605,-2405],"goal":[1122,-2440],"doors":[[438,-1674,438,-1795,"#55ddff",true],[930,-2154,930,-2275,"#55ddff",true],[930,-1674,930,-1795,"#55ddff",false],[-290,-644,-291,-940,"#2aff80",false],[1110,-1231,1045,-1104,"#2aff80",true],[561,-2560,807,-2560,"#2aff80",true],[338,-1161,186,-1176,"#2aff80",true],[628,-1213,633,-1354,"#2aff80",false]],"obstacles":[[930,-2154,1248,-2154,1348,-2079,1377,-1953,1322,-1847,1189,-1795,930,-1795,930,-2154],[502,-1365,342,-1338,235,-1268,186,-1176,186,-940,-291,-940,-291,-1268,-143,-1523,117,-1674,438,-1674,684,-1422,930,-1674,1189,-1674,1189,-1674,1322,-1604,1377,-1511,1388,-1396,1294,-1267,1110,-1231,894,-1333,502,-1365],[561,-2560,438,-2560,438,-1795,77,-1795,-235,-1615,-416,-1302,-416,-940,-416,-645,311,-645,311,-1058,338,-1161,416,-1218,844,-1204,1045,-1104,1248,-1056,1424,-1066,1557,-1125,1694,-1386,1750,-1735,1740,-2111,1794,-2294,1917,-2427,1945,-2542,1841,-2671,1661,-2725,1534,-2685,1468,-2546,1415,-2404,1341,-2313,1248,-2275],[1248,-2275,930,-2275,930,-2560,807,-2560,807,-2637,995,-2637,995,-2341,1285,-2341,1285,-2720,1137,-2873,586,-2873,438,-2755,438,-2637,558,-2637,561,-2560],[1565,-2459,1650,-2476,1697,-2406,1656,-2298,1571,-2254,1512,-2300,1565,-2459]],"collectibles":[[1711,-2578,"#55ddff"],[863,-1253,"#2aff80"],[991,-1732,"#a0892c"],[1107,-1730,"#a0892c"],[991,-2210,"#a0892c"],[1145,-2210,"#a0892c"],[351,-1732,"#a0892c"],[120,-1732,"#a0892c"],[612,-1880,"#a0892c"],[487,-1749,"#a0892c"],[663,-1965,"#a0892c"],[562,-1808,"#a0892c"],[248,-980,"#2aff80"],[429,-1281,"#2aff80"],[714,-2045,"#a0892c"],[782,-2128,"#a0892c"],[860,-2183,"#a0892c"],[1734,-2308,"#a0892c"],[1493,-2433,"#a0892c"],[1342,-1165,"#a0892c"],[-356,-947,"#a0892c"],[-184,-1571,"#a0892c"],[-351,-1287,"#a0892c"],[748,-2511,"#a0892c"],[875,-2269,"#a0892c"],[822,-2348,"#a0892c"],[780,-2428,"#a0892c"],[1408,-2024,"#a0892c"],[1376,-2107,"#a0892c"],[1306,-2162,"#a0892c"]]}',

    '{"start":[-1268,-3910],"goal":[-2649,-3240],"doors":[[-3067,-3066,-3173,-3066,"#55ddff",true],[-2466,-2660,-2466,-2873,"#2aff80",true],[-987,-3669,-1093,-3669,"#55ddff",true],[-1201,-2875,-1201,-3019,"#55ddff",true],[-987,-3642,-1093,-3642,"#2aff80",true],[-2216,-3080,-2322,-3080,"#55ddff",false],[-2216,-3052,-2322,-3052,"#2aff80",false]],"obstacles":[[-1243,-4197,-1623,-3689,-1093,-3689,-1093,-3617,-1358,-3377,-1623,-3617,-1623,-3495,-1695,-3495,-1695,-3617,-2419,-3617,-2419,-3109,-2322,-3109,-2322,-3020,-2419,-3020,-2419,-2873,-2512,-2873,-2512,-3020,-3067,-3020,-3067,-3109,-2512,-3109,-2512,-3617,-3236,-3617,-3236,-3109,-3173,-3109,-3173,-3020,-3579,-2893,-3579,-2639,-2512,-2512,-2512,-2660,-2419,-2660,-2419,-2512,-1839,-2512,-1569,-2047,-779,-2047,-485,-2512,-485,-3020,-485,-4197,-794,-4197,-794,-4121,-900,-4121,-900,-4197,-1243,-4197],[-900,-4015,-794,-4015,-794,-3689,-696,-3689,-696,-3617,-794,-3617,-794,-3020,-2216,-3020,-2216,-3109,-1695,-3109,-1695,-3388,-1623,-3388,-1623,-3109,-900,-3109,-900,-3617,-987,-3617,-987,-3689,-900,-3689,-900,-4015],[-3006,-3161,-3006,-3361,-2767,-3361,-3006,-3161],[-2132,-3436,-1767,-3436,-2132,-3179,-2132,-3436],[-882,-2305,-1101,-2370,-1278,-2226,-1284,-2454,-1475,-2579,-1260,-2655,-1201,-2875,-1062,-2694,-835,-2706,-964,-2518,-882,-2305]],"collectibles":[[-2263,-3402,"#55ddff"],[-853,-4068,"#a0892c"],[-1122,-3272,"#2aff80"],[-638,-3652,"#a0892c"],[-2634,-2766,"#a0892c"],[-3463,-2766,"#a0892c"],[-1014,-2937,"#a0892c"],[-1936,-2649,"#a0892c"],[-1532,-2290,"#a0892c"],[-1374,-2931,"#a0892c"],[-853,-2272,"#a0892c"],[-1664,-3440,"#a0892c"]]}',

    '{"start":[-211,-2507],"goal":[948,-3195],"doors":[[669,-2722,944,-2862,"#2aff80",true],[397,-2869,445,-2564,"#55ddff",true],[888,-2558,1106,-2339,"#d8ed7a",true],[526,-2302,659,-2010,"#55ddff",false],[1321,-3846,1413,-3610,"#d8ed7a",true]],"obstacles":[[659,-2010,800,-2299,1106,-2339],[888,-2558,944,-2862],[669,-2722,397,-2869],[445,-2564,221,-2351,526,-2302,24,-2302,-40,-2934,-481,-2601,24,-2010,659,-2010],[221,-2351,-72,-3251,233,-3466,532,-3242,397,-2869],[154,-3046,107,-3195,236,-3285,361,-3191,310,-3043,154,-3046],[944,-2862,746,-3246,1010,-3373,1220,-2988,1846,-3152,1547,-3924,233,-3466],[1413,-3610,1543,-3283,1327,-3190],[1106,-2339,1220,-2988]],"collectibles":[[1513,-3769,"#d8ed7a"],[670,-2477,"#55ddff"],[229,-3353,"#2aff80"],[58,-3095,"#a0892c"],[401,-3088,"#a0892c"],[-115,-2743,"#a0892c"],[-153,-2614,"#a0892c"],[-53,-2261,"#a0892c"],[653,-3236,"#a0892c"],[581,-2976,"#a0892c"],[1241,-3164,"#a0892c"],[1258,-3683,"#a0892c"],[1112,-3632,"#a0892c"],[964,-3577,"#a0892c"],[346,-2146,"#a0892c"]]}',

    '{"start":[303,-3351],"goal":[301,-2326],"doors":[[447,-2540,164,-2508,"#02007e",true],[696,-2061,870,-2300,"#2aff80",true],[447,-3462,447,-3322,"#55ddff",true],[508,-3262,792,-2978,"#55ddff",false],[508,-3401,792,-3118,"#55ddff",false],[855,-3054,855,-2914,"#55ddff",true],[508,-2632,792,-2540,"#55ddff",true],[1182,-1921,813,-1957,"#ffe680",false],[1122,-2300,1296,-2061,"#ffe680",true],[855,-3839,1139,-3839,"#ffe680",true],[1179,-2485,1139,-2355,"#02007e",false],[1139,-2583,996,-2689,"#02007e",true],[855,-2587,996,-2689,"#02007e",true],[855,-2520,995,-2621,"#02007e",true],[1138,-2516,995,-2621,"#02007e",true]],"obstacles":[[1122,-2300,870,-2300,792,-2540,855,-2587],[1139,-2583,1196,-2540,1179,-2485],[1122,-2300,1139,-2355,909,-2355,855,-2520],[1138,-2516,1179,-2485],[872,-1618,852,-1506,669,-1799,560,-1812,571,-1899,277,-2120,-61,-1977,-106,-1611,187,-1390,526,-1534,535,-1610,656,-1597,799,-1410],[1139,-2583,1139,-3705,855,-3578,855,-3465,792,-3401,792,-3620,855,-3620,1139,-3747],[792,-2540,792,-2978,855,-2914,855,-2587],[855,-3325,855,-3054,792,-3118,792,-3262,855,-3325],[447,-3322,508,-3262,508,-3118,447,-3057,447,-3322],[508,-2632,508,-2978,447,-2917,447,-2540],[855,-3745,855,-4040,1139,-4040,1139,-3747],[855,-3745,792,-3745,792,-3839,508,-3839,508,-3401,447,-3462,447,-3839,164,-3839,164,-2620],[164,-2508,164,-2191,428,-2191,447,-2540],[696,-2061,508,-2632],[1296,-2061,1479,-2632,1196,-2540],[696,-2061,813,-1957,863,-1834,872,-1618],[799,-1410,630,-1224,408,-1126,165,-1117,-70,-1201,-275,-1392,-385,-1640,-393,-1912,-297,-2175,-85,-2401,164,-2508],[1296,-2061,1182,-1921],[382,-1819,252,-1917,102,-1853,82,-1692,212,-1594,362,-1657,382,-1819],[1182,-1921,1050,-1832,1002,-1605,905,-1348,698,-1132,432,-1018,142,-1012,-136,-1119,-369,-1343,-491,-1631,-496,-1944,-380,-2245,-290,-2363,-181,-2463,-57,-2543,79,-2601,164,-2620],[1139,-2583,1138,-2516],[855,-2587,855,-2520],[996,-2689,995,-2621]],"collectibles":[[651,-3756,"#55ddff"],[537,-3303,"#a0892c"],[994,-3756,"#2aff80"],[681,-3159,"#a0892c"],[609,-3231,"#a0892c"],[755,-3088,"#a0892c"],[33,-1907,"#ffe680"],[256,-2005,"#a0892c"],[200,-1499,"#a0892c"],[441,-1606,"#a0892c"],[480,-1850,"#a0892c"],[5,-1654,"#55ddff"],[1009,-2474,"#02007e"],[994,-3944,"#55ddff"],[299,-3719,"#a0892c"],[299,-3631,"#a0892c"],[299,-3156,"#a0892c"],[-444,-1928,"#a0892c"],[-318,-1365,"#a0892c"],[1001,-2254,"#a0892c"],[947,-1700,"#a0892c"],[166,-2559,"#a0892c"],[277,-2661,"#a0892c"],[333,-2793,"#a0892c"]]}'
];
