import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store.ts';
import AppRouter from './routes/AppRouter.tsx'
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </Provider>
  </StrictMode>,
)
