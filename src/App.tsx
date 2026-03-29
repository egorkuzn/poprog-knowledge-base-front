import viteLogo from "/vite.svg";
import reactLogo from "/vite.svg";
import { Link, Outlet } from "react-router-dom";

export function App() {
  return (
    <>

      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <nav>
        <Link to="/vite-react-router/">Home</Link>
        {" | "}
        <Link to="/vite-react-router/contact">Contact</Link>
      </nav>

      <Outlet />
    </>
  );
}
