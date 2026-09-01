// export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
//   const res = await fetch(input, { ...init, credentials: "include" });

//   if (res.status === 401) {
//     if (window.location.pathname !== "/login") {
//       window.location.href = "/login";
//     }
//   }

//   return res;
// }
