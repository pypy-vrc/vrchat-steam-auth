const path = require("path");
const child_process = require("child_process");
const axios = require("axios");

(async function () {
  try {
    const steamTicket = await new Promise((resolve, reject) => {
      child_process.execFile(
        path.resolve("./SteamKitAuth/SteamKitAuth.exe"),
        [
          "--no-2fa",
          "--app-id 1049590",
          // `--username ${username}`,
          // `--password ${password}`,
        ],
        (err, stdout, stderr) => {
          if (err !== null) {
            reject(err);
            return;
          }

          const matches = stdout.toString().match(/Ticket=([0-9A-Z]+)/);
          if (matches === null) {
            reject(new Error(`${stdout}\n${stderr}`));
            return;
          }

          resolve(matches[1]);
        }
      );
    });

    const api = axios.default.create({
      baseURL: "https://api.vrchat.cloud/api/1",
      validateStatus: null,
    });

    const configResponse = await api.request({
      url: "config",
    });
    console.log("configResponse", {
      status: configResponse.status,
      headers: configResponse.headers,
      data: configResponse.data,
    });

    const clientApiKey = configResponse.data?.clientApiKey;
    if (clientApiKey === void 0) {
      return;
    }

    const authResponse = await api.request({
      url: `auth/steam?apiKey=${clientApiKey}`,
      method: "POST",
      data: {
        steamTicket,
      },
    });
    console.log("authResponse", {
      status: authResponse.status,
      headers: authResponse.headers,
      data: authResponse.data,
    });
  } catch (err) {
    console.error(err);
  }
})();
