// Fix btoa unavailable in axios 1.6.x - https://github.com/axios/axios/issues/2235

import { decode as atob, encode as btoa } from "base-64";

if (!global.btoa) global.btoa = btoa;

if (!global.atob) global.atob = atob;
