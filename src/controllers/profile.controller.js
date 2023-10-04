import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUserData = async (req, res) => {
  const { uid } = req.body;

  try {
    const user = await prisma.user.findOne({
      where: {
        id: uid,
      },
    });

    if (!user) {
      res
        .status(404)
        .send({ status: "Error", message: "No user found with this id ..." });
    }

    res.status(200).send({
      status: "OK",
      data: user,
      message: "User detials succesfully accessed ...",
    });
  } catch (error) {
    res
      .status(500)
      .send({ status: "Error", message: "Server error occured ..." });
  }
};

export const editProfile = async (req, res) => {
  const { uid, data } = req.body;

  try {
    const user = await prisma.user.findOne({
      where: {
        id: uid,
      },
    });

    if (!user) {
      res
        .status(404)
        .send({ status: "Error", message: "No user found with this id ..." });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: data,
    });

    res.status(200).send({
      status: "OK",
      data: updatedUser,
      message: "User detials succesfully updated ...",
    });
  } catch (error) {
    res
      .status(500)
      .send({ status: "Error", message: "Server error occured ..." });
  }
};

export const refreshToken = async (req, res) => {
    
}