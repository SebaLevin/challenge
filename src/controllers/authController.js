import { AuthService } from "../services/index.js";

const authServices = new AuthService();

export class AuthController {

    getToken(req, res) {

        try {
            const token = authServices.generateToken();

            return res.status(200).json({ token });
        } catch (error) {

            return res.status(500).send(error.message);
        };
    };

    async getRefreshToken(req, res) {
        const { refreshToken } = req.body

        try {

            if (!refreshToken) {
                return res.status(404).json({ error: 'You must send a token' });
            }
            const newToken = await authServices.getRefreshToken(refreshToken);

            return res.status(200).send(newToken);
        } catch (error) {

            return res.status(401).json({ error });
        }




    }
};