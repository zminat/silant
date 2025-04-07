import './App.css'
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Main from "./components/Main.tsx";

function App() {
    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Main />} />
                    {/*<Route path="/search" element={<Search />} />*/}
                    {/*<Route path="/results" element={<Results />} />*/}
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App
