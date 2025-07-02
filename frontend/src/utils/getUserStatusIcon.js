import crownIcon from '../images/crown.png';
import colaboratorIcon from '../images/colaborator.png';
import userIcon from '../images/user.png';

const getUserStatusIcon = (userStatus) => {
  switch (userStatus) {
    case 'owner':
      return crownIcon;
    case 'collaborator':
      return colaboratorIcon;
    case 'participant':
    default:
      return userIcon;
  }
};

export default getUserStatusIcon;
