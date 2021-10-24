import userRepo from '../../repositories/user-repository';


async function getUserByAccessToken(accessToken: string) {
    const user = await userRepo.findOne({ accessToken: accessToken });
    return user;
}

export default getUserByAccessToken;
