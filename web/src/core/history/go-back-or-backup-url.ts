import { history } from './history';


function goBackOrBackupUrl(backupUrl: string) {
    if (history.location.key) {
        history.goBack();
    } else {
        history.push(backupUrl);
    }
}

export default goBackOrBackupUrl;
