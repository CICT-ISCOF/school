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
			profilePicture: File.create({
				url:
					'http://www.iscof.edu.ph/oasyrtyd/2018/05/ISCOF-Seal-img1-300x300.png',
				size: 120250,
				type: 'image/png',
				name: 'photo.png',
				public: 1,
			}),
			coverPhoto: File.create({
				url:
					'http://www.iscof.edu.ph/oasyrtyd/2020/09/0title-card-Copy.jpg',
				size: 120250,
				type: 'image/png',
				name: 'photo.png',
				public: 1,
			}),
		};
	})
	.then(({ user, coverPhoto, profilePicture }) => {
		return Promise.all([coverPhoto, profilePicture]).then(
			([coverPhoto, profilePicture]) => {
				return {
					user,
					coverPhoto,
					profilePicture,
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
						CoverPhotoId: coverPhoto.id,
						ProfilePictureId: profilePicture.id,
					}),
				};
			}
		);
	})
	.then(({ user, coverPhoto, profilePicture, school }) => {
		return school.then((school) => {
			return {
				user,
				coverPhoto,
				profilePicture,
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
	.then(({ user, coverPhoto, profilePicture, school, degree }) => {
		return degree.then((degree) => {
			return {
				user,
				coverPhoto,
				profilePicture,
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
	.then(({ user, coverPhoto, profilePicture, school, degree, course }) => {
		return course.then((course) => {
			return {
				user,
				coverPhoto,
				profilePicture,
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
	.then(
		({
			user,
			coverPhoto,
			profilePicture,
			school,
			degree,
			course,
			major,
		}) => {
			return major.then((major) => {
				return {
					user,
					coverPhoto,
					profilePicture,
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
		}
	)
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
