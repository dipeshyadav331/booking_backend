const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initSeats(){
	try{
		const existingSeats = await prisma.seats.findMany();

		if(existingSeats.length > 0){
			return;
		}
		
		// 1 at the jth position in the ith seatrow denotes the jth seat in ith row is booked
		// 0 in the setbit denotes the seat is empty
		
		const seats = await Promise.all(
			Array.from({length : 11} , (_ , i) => 
				prisma.seats.create({
					data : {
						seatbit : '0000000',
						seatrow : i + 1
					}
				})
			)
		)
		
		// initialise the last row with only 3 seats
		const lastRowSeat = await prisma.seats.create({
			data : {
				seatbit : '000',
				seatrow : 12
			}
		});
	}
	catch(e){
		console.log(e.message);
	}
}

initSeats();


module.exports = { initSeats }