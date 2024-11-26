import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import store from "./components/redux/store.jsx";
import { Provider } from "react-redux";
import { SocketProvider } from "./pages/chat/socketContext.jsx";  

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createRoot(document.getElementById('root')).render(
  <>
  <Provider store={store}>
  <SocketProvider>

      <App />
      </SocketProvider>

  </Provider>
  </>
);
