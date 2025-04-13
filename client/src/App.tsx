import './App.css'
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Main from "./components/Main.tsx";
import ReferenceDetail from "./components/ReferenceDetail.tsx";

function App() {
    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/machine-models/:id" element={<ReferenceDetail type="machine-models" title="Модель техники" />} />
                    <Route path="/engine-models/:id" element={<ReferenceDetail type="engine-models" title="Модель двигателя" />} />
                    <Route path="/transmission-models/:id" element={<ReferenceDetail type="transmission-models" title="Модель трансмиссии" />} />
                    <Route path="/drive-axle-models/:id" element={<ReferenceDetail type="drive-axle-models" title="Модель ведущего моста" />} />
                    <Route path="/steering-axle-models/:id" element={<ReferenceDetail type="steering-axle-models" title="Модель управляемого моста" />} />
                    <Route path="/maintenance-types/:id" element={<ReferenceDetail type="maintenance-types" title="Вид ТО" />} />
                    <Route path="/failure-nodes/:id" element={<ReferenceDetail type="failure-nodes" title="Узел отказа" />} />
                    <Route path="/recovery-methods/:id" element={<ReferenceDetail type="recovery-methods" title="Способ восстановления" />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App
