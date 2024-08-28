import { useParams } from "react-router-dom";
import ApprovalProfessional from "../../components/ApprovalProfessional";

function Callback() {
    const { id, request } = useParams();

    return <ApprovalProfessional request={request} id={id} />;
}

export default Callback;
