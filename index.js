const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { initSeats } = require('./initSeats');
const authRoute = require('./auth')
const authenticateToken = require('./authmiddleware');
const cors = require('cors');


const prisma = new PrismaClient();


const app = express();
app.use(cors())

const port = 3000;

app.use(express.json());

app.use('/auth' , authRoute);

app.get('/seats', authenticateToken, async (req, res) => {
    try {
      const seats = await prisma.seats.findMany({
        orderBy: {
          seatrow: 'asc'
        }
      });
      res.status(200).json(seats);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching seats' });
    }
});

app.post('/reset' , authenticateToken , async (req , res) => {
    await prisma.seats.updateMany({
        where : {
            seatrow : {
                lte : 11
            }
        }, 
        data : {
            seatbit : "0000000"
        }
    })

    await prisma.seats.update({
        where : {
            seatrow : 12
        },
        data : {
            seatbit : "000"
        }
    })

    res.status(200).json({
        message : "All seats are reset successfully"
    });
});

app.post('/book_seats' , authenticateToken , async(req , res) => {
    const seatstoBook = req.body.bookSeats;

    if(seatstoBook > 7){
        return res.status(400).json({
            error : "can't book more than 7 seats at a time"
        })
    }

    const seats = await prisma.seats.findMany({
        where : {
            seatrow : {
                gte : 1, 
                lte : 12
            }
        }, 
        orderBy : {
            seatrow : 'asc'
        }
    })

    let unbookedRow = []; 
    for(const seat of seats){
        const unbookedSeats = seat.seatbit.split('').filter(char => char === '0').length;
        unbookedRow.push(unbookedSeats);
        
        if(unbookedSeats >= seatstoBook){
            const seatarray = seat.seatbit.split('');
            let remainingSeats = seatstoBook;
            
            let bookedSeats = [];

            for(let i = 0 ; i < 7 && remainingSeats > 0 ; i++){
                if(seatarray[i] === '0'){
                    seatarray[i] = '1';
                    bookedSeats.push(((seat.seatrow - 1) * 7) + (i + 1));
                    remainingSeats--;
                }
            }

            await prisma.seats.update({
                where : {
                    seatrow : seat.seatrow
                },
                data : {
                    seatbit : seatarray.join('')
                }
            })

            return res.status(200).json({
                bookedSeats
            })
        }
    }
    
    let preArr = [];
    preArr.push(0);

    for(let i = 0 ; i < 12 ; i++){
        preArr.push(preArr[i] + unbookedRow[i]);
    }
 
    for(let i = 2 ; i < 12 ; i++){
        for(let j = i ; j <= 12 ; j++){
            const availableSeats = preArr[j] - preArr[j-i];

            if(availableSeats >= seatstoBook){
                let bookedSeatrows = [];
                let remSeats = seatstoBook;
                
                for(let k = j - i + 1 ; k <= j && remSeats > 0 ; k++){
                    let strrow = seats[k-1].seatbit; 
                    const seatrowArray = strrow.split('');
                    for(let l = 0 ; l < 7 && remSeats > 0 ; l++){
                        if(seatrowArray[l] === '0'){
                            seatrowArray[l] = '1';
                            bookedSeatrows.push(((seats[k-1].seatrow - 1) * 7) + (l + 1));
                            remSeats--;
                        }
                    }

                    await prisma.seats.update({
                        where : {
                            seatrow : seats[k-1].seatrow
                        },
                        data : {
                            seatbit : seatrowArray.join('')
                        }
                    })
                } 

                return res.status(200).json({
                    bookedSeats : bookedSeatrows
                })
            }
        }
    }
 
    return res.status(500).json({
        error : "Seats not available"
    })
})

app.listen(port , async () => {
    await initSeats();
    console.log(`server is running on the port ${port}`);
})

/*

things which can be improved further

-> using mutex to ensure that no seat is booked by two user
-> the reset seat option should be shown to admin user only

*/