import Image from "next/image";

const facultyMembers = [
	{
		name: "Abdul Wasiq",
		subject: "Physics",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Abdul Wasiq.png",
	},
	{
		name: "Adil Amir",
		subject: "Chemistry",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Adil Amir.png",
	},
	{
		name: "Shahid Ansari",
		subject: "Islamiyat",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Shahid Ansari.png",
	},
	{
		name: "Ghazanfar Sultan",
		subject: "Chemistry & Biology",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Ghazanfar Sultan.png",
	},
	{
		name: "Shahbaz Ali",
		subject: "Accounting",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Shahbaz Ali.png",
	},
	{
		name: "Faysal Aleemi",
		subject: "Islamiyat",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Faysal Aleemi.png",
	},
	{
		name: "Daniyal Ilyas",
		subject: "Economics & Business",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Daniyal Ilyas.png",
	},
	{
		name: "Faiq",
		subject: "English",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Faiq.png",
	},
	{
		name: "Humaira Shamim",
		subject: "Urdu",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Humaira Shamim.png",
	},
	{
		name: "Ali Ammar",
		subject: "Pakistan Studies",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Ali Ammar.png",
	},
	{
		name: "Shehroz Ilyas",
		subject: "Computer Science",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Shehroz Ilyas.png",
	},
	{
		name: "Hannan Abdul Khaliq",
		subject: "Biology",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Hannan Abdul Khaliq.png",
	},
	{
		name: "Faraz Aftab",
		subject: "Sociology",
		role: "Lecturer",
		board: "Alevels & IB",
		img: "/Faculty/Teachers/Faraz Aftab.png",
	},
];


export default function FacultyPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-silver via-primary-white to-accent-lightblue flex flex-col items-center py-12 px-4">
			<div className="w-full max-w-4xl mx-auto text-center mb-12">
				<h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-blue mb-4 drop-shadow animate-fade-in">Meet Our Faculty</h1>
				<p className="text-lg md:text-xl text-primary-blue/80 font-body animate-fade-in delay-200">
					Our dedicated and experienced faculty are the heart of Habibians&apos; Academy. Get to know the educators who inspire and guide our students every day.
				</p>
			</div>
			<div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
				{facultyMembers.map((member, idx) => (
					<div
						key={idx}
						className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col border border-blue-900/80 hover:shadow-2xl transition-all duration-500 h-[460px]"
					>
						{/* Image section */}
						<div className="w-full flex-1 flex items-center justify-center bg-[#e5e7eb]" style={{ minHeight: 220, maxHeight: 260 }}>
							<div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ minHeight: 220, maxHeight: 260 }}>
								<Image
									src={member.img}
									alt={member.name}
									width={220}
									height={260}
									className="object-contain w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110 hover:scale-110"
									style={{ maxHeight: 260, maxWidth: '100%' }}
								/>
							</div>
						</div>
						{/* Name bar */}
						<div className="w-full bg-[#23387c] py-4 flex items-center justify-center">
							<h3 className="text-2xl font-bold text-white text-center">{member.name}</h3>
						</div>
						{/* Subject and Board section */}
						<div className="w-full bg-white py-4 flex flex-col items-center justify-center rounded-b-[2.5rem] space-y-2">
							<p className="text-xl text-black text-center font-medium">{member.subject}</p>
							<p className="text-lg text-blue-600 text-center font-medium">{member.board}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}