import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { Home } from "./views/Home";
import { ActivityFeed } from "./views/ActivityFeed";
import { Search } from "./views/Search";
import { Profile } from "./views/Profile";
import { GameDetail } from "./views/GameDetail";
import { Friends } from "./views/Friends";
import { Login } from "./views/Login";
import { Register } from "./views/Register";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "activity", Component: ActivityFeed },
      { path: "search", Component: Search },
      { path: "profile", Component: Profile },
      { path: "game/:id", Component: GameDetail },
      { path: "friends", Component: Friends },
    ],
  },
]);