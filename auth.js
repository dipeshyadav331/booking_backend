const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { z } = require('zod');

const signupSchema = z.object({
	email : z.string().email("Invalid Email Format"),
	password : z.string()
		.min(8 , "password should be atleast 8 characters"),
	firstName : z.string(),
	lastName : z.string()
});

const signinSchema = z.object({
    email : z.string().email("Invalid email format"),
    password : z.string(),
})


router.post('/signin' , async (req , res) => {
    const { email , password } = req.body;

    const validation = signinSchema.safeParse(req.body);

    if(!validation.success){
        return res.status(400).json({
            error : "Validation input Failed",
            details : validation.error
        });
    }

    try{
        const user = await prisma.users.findFirst({
            where : {
                email
            }
        });

        if(!user){
            return res.status(401).json({
                error : "Invalid Credentials"
            });
        }

        const isValidPassword = await argon2.verify(user.password , password);
        if(!isValidPassword){
            return res.status(401).json({
                error : "Invalid credentials"
            });
        }

        const token = jwt.sign({
                userId : user.Id
            } , "MY_SECRET"
        );

        res.status(200).json({
            message : "User logged in successfully",
            token
        })
    }
    catch(e){
        res.status(500).json({
            error : "Some error occurred"
        });
    }

})

router.post('/signup' , async (req , res) => {
	try{
		const {email , password , firstName , lastName } = req.body;

		const validation = signupSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: validation.error.errors[0].message,
            });
        } 
		const existingUser = await prisma.users.findFirst({
			where : { email }
		});

		if(existingUser){
			return res.status(400).json({
				error : "User with this email already exists"
			});
		}
		const hashedPassword = await argon2.hash(password);
		const user = await prisma.users.create({
			data : {
				email, 
				password : hashedPassword,
				firstName,
				lastName
			}
		});
        
		const token = jwt.sign({
				userId : user.id 
			} , "MY_SECRET"
		);
		res.status(201).json({
			message : "user created successfully",
			token
		});
	}
	catch(e){
		res.status(500).json({
			error : "Error creating user"
		});
	}
})
			
module.exports = router;
