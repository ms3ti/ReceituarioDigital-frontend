import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
    CreatePrescriptionModel,
    EditPrescription,
    EditPrescriptionModel,
    Prescription,
    ShowPrescriptions,
    EmergencyDoc
} from "./pages";
import { Admin } from "./pages/admin";
import Callback from "./pages/callback";
import Login from "./pages/login";

export function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/showPrescriptions/:doctorId"
                    element={<ShowPrescriptions />}
                />
                <Route path="prescription" element={<Prescription />} />
                <Route path="emergencyDoc" element={<EmergencyDoc />} />
                <Route path="callback/:id/:request" element={<Callback />} />
                <Route path="admin" element={<Admin />} />
                <Route
                    path="/editPrescription/:prescriptionId"
                    element={<EditPrescription />}
                />
                <Route
                    path="/createPrescriptionModel"
                    element={<CreatePrescriptionModel />}
                />
                <Route
                    path="/editPrescriptionModel/:prescriptionModelId"
                    element={<EditPrescriptionModel />}
                />
            </Routes>
        </BrowserRouter>
    );
}
