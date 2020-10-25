require('./server');
const hash = require('bcrypt');
const {
	User,
	File,
	School,
	Degree,
	Course,
	Major,
	Education,
} = require('./models');

User.create({
	username: 'admin',
	password: hash.hashSync('admin', 10),
	type: 'Admin',
})
	.then((user) => {
		return {
			user,
			file: File.create({
				url:
					'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Round_Landmark_School_Icon_-_Transparent.svg/512px-Round_Landmark_School_Icon_-_Transparent.svg.png',
				size: 30921,
				type: 'image/png',
				name: 'photo.png',
				public: 1,
			}),
		};
	})
	.then(({ user, file }) => {
		return file.then((file) => {
			return {
				user,
				file,
				school: School.create({
					region: '6',
					type: 'Public',
					district: '6',
					province: 'Iloilo',
					name: 'Iloilo State College of Fisheries',
					address: 'Barotac Nuevo, Iloilo',
					phone: '09169258735',
					email: 'president@iscof.edu.ph',
					website: 'iscof.edu.ph',
					curricular_program: 'Program',
					mission: 'Mission',
					vision: 'Vision',
					UserId: user.id,
					FileId: file.id,
				}),
			};
		});
	})
	.then(({ user, file, school }) => {
		return school.then((school) => {
			return {
				user,
				file,
				school,
				degree: Degree.create({
					name: 'Doctorate Degree',
					type: 'PhD',
					SchoolId: school.id,
					description: 'Description',
				}),
			};
		});
	})
	.then(({ user, file, school, degree }) => {
		return degree.then((degree) => {
			return {
				user,
				file,
				school,
				degree,
				course: Course.create({
					title: 'PhD in Information Technology',
					tuition: '3,000',
					DegreeId: degree.id,
					description: 'Description',
				}),
			};
		});
	})
	.then(({ user, file, school, degree, course }) => {
		return course.then((course) => {
			return {
				user,
				file,
				school,
				degree,
				course,
				major: Major.create({
					title: 'Major in Programming',
					CourseId: course.id,
					description: 'Description',
				}),
			};
		});
	})
	.then(({ user, file, school, degree, course, major }) => {
		return major.then((major) => {
			return {
				user,
				file,
				school,
				degree,
				course,
				major,
				education: Education.create({
					type: 'Preschool',
					tuition: '5,000',
					SchoolId: school.id,
					description: 'Description',
				}),
			};
		});
	})
	.then(({ education }) => {
		return education.then((education) => education);
	})
	.then(() => {
		console.log('\n', 'Seeding complete', '\n');
	})
	.catch((error) => {
		console.log('\n', error, '\n');
	})
	.finally(() => process.exit(0));
