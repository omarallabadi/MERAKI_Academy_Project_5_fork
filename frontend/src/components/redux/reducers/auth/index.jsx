import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: sessionStorage.getItem("token"),
    userId: sessionStorage.getItem("userId"),
    userName: sessionStorage.getItem("userName"),
    isLoggedIn: JSON.parse(sessionStorage.getItem("isLoggedIn")) || false,
    allMessages:[]
  },
  reducers: {
    setAllMessages: (state, action) => {
      const messages = action.payload;
      state.allMessages = messages;
      
    },
    setLogin: (state, action) => {
      const token = action.payload;
      state.token = token;
      state.isLoggedIn = true;
      sessionStorage.setItem("isLoggedIn", JSON.stringify(true));
      sessionStorage.setItem("token", token);
    },
    setUserId: (state, action) => {
      const userId = action.payload;
      state.userId = userId;
      sessionStorage.setItem("userId", userId);
    },
    setUserName: (state, action) => {
      const userName = action.payload;
      state.userName = userName;
      sessionStorage.setItem("userName", userName);
    },
    setLogout: (state) => {
      state.token = null;
      state.isLoggedIn = false;
      state.userId = null;
      state.userName = null;

      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("userName");
    },
  },
});

export const { setLogin, setUserId, setUserName, setLogout,setAllMessages } =
  authSlice.actions;
export default authSlice.reducer;
