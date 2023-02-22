const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;
console.log('connecting to', url);

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: [true, 'number is required'],
    minLength: 8,
    validate: {
      validator: function (v) {
        const re = /(^\d{3}-\d{5})|(^\d{2}-\d{6})/;
        return !v || !v.trim().length || re.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid number. Use this format: 123-12345 or 12-123456`,
    },
  },
});
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
