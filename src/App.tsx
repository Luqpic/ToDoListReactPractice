import TodoPage from "./pages/TodoPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <TodoPage />
    </AuthProvider>
  );
}

export default App;
