# React Task: Phone OTP Login + Restaurants List

React (Vite) app that uses the Fastor staging APIs from the provided Postman collection.

## Flow
1. **Login screen**: enter a 10 digit mobile number, calls `POST /v1/pwa/user/register` (sends OTP).
2. **OTP screen**: enter the OTP, calls `POST /v1/pwa/user/login` and gets a JWT (`data.token`). Default OTP on staging is `123456`.
3. **Restaurants screen**: calls `GET /v1/m/restaurant?city_id=118` with `Authorization: Bearer <token>` and lists the restaurants.

The token is kept in `localStorage`, so a page refresh keeps the user logged in. Logout clears it.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Notes
- Sample login: phone `9818979450`, OTP `123456`.
- The Figma link in the task email was unavailable ("file may have been deleted, moved, or made unavailable"), so the UI is my own mobile-first design.
- The API returns the literal string `"null"` for missing addresses, and its logo URLs return 404, so the UI hides empty addresses and shows the restaurant's initial when the logo fails to load.
- API failures come back with `status: "Failed"` and an `error_message` in the body, which is what the error messages in the UI show.
