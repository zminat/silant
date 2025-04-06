import './App.css'
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Main from "./components/Main.tsx";

function App() {
    return (
        <>
            <Header />
            <main>
                <Main />
            </main>
            <Footer />
        </>
    );
}

export default App
