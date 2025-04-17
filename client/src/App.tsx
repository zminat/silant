import './App.css'
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Main from "./components/Main.tsx";
import {LoadingErrorProvider} from "./components/contexts/LoadingErrorContext.tsx";

function App() {
    return (
        <>
            <Header/>
            <main>
                <LoadingErrorProvider>
                    <Main/>
                </LoadingErrorProvider>
            </main>
            <Footer/>
        </>
    );
}

export default App
