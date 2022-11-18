// Dynamic Properties

// You must use complete paths for the following properties
const modelPath = "model"; // This is the path to the model folder that you downloaded from Custom Vision
const imgPath = ["sample_pics/IMG_20200314_181056a.jpg", "sample_pics/IMG_20200314_181056.jpg"] // image directory to read multiple files
const imagePath = "sample_pics/IMG_20200229_165033.jpg"; // This is the path to the image you want to classify
const exportImagePath = "./parsed_images/000.jpg"; // This is a path to a non exist file that will be used to store the output/overlay image
const LabelColors = { // This is a dictionary of colors for labels that will be used to generate the overlay image
	"Apple": "rgba(0, 0, 0, 0.5)",
	// Modify the items below to have the key = each tag name, and the value = the color you want to use to output/overlay the image
	"Banana": "rgba(216, 58, 62, 0.65)",
	"Orange": "rgba(59, 217, 211, 0.65)"
};
const probabilityThreshold = 0.5; // 0.5 = 50% (only predictions that are >= to this value will be shown in the output image)

///////////////////////////////////////////////////////////////////////////////

// Code (you shouldn't need to modify this)

// External dependencies (npm packages)
const vision = require("@microsoft/customvision-tfjs-node");
const sharp = require("sharp");

// Internal dependencies
const fs = require("fs").promises;
const path = require("path");

(async () => {
	// Create a new ObjectDetectionModel instance
	const model = new vision.ObjectDetectionModel();
	// Load the model.json file from the modelPath defined in the Dynamic Properties above
	await model.loadModelAsync("file://" + path.join(modelPath, "model.json"));
	// Read the image into memory
	const image = await fs.readFile(imgPath);
	// Execute the model on the image
	const result = await model.executeAsync(image);
	// Get labels.txt from the modelPath and parse it into an array of strings
	const labels = (await fs.readFile(path.join(modelPath, "labels.txt"), "utf8")).split("\n");
	// Create an empty array to store the classification data
	let objectClassifications = [];
	// Loop through each prediction
	for (let i = 0; i < result[0].length; i++) {
		// Get the label index (this will correspond to the labels.txt file)
		const labelIndex = result[2][i];
		// Get the label text value from the labels.txt array created previously
		const label = labels[labelIndex];
		// Add the bounding box coordinates, probability, and label to the classification data
		objectClassifications.push(new ObjectClassification(result[0][i], result[1][i], label));
	}
	// Generate new overlay image
	const newImageResult = await generateOverlayImage(image, objectClassifications);
	// Write new overlay image to disk
	await fs.writeFile(exportImagePath, newImageResult);

	// Print details to console
	console.log(new Array(5).fill("\n").join(""));
	console.log(objectClassifications.filter((item) => item.probability >= probabilityThreshold).map((item) => `${item.label}: ${item.probability}`).join("\n"));
	console.log("File written to: ", exportImagePath);
	console.log("Done!");
})();

// Class to store classification details
class ObjectClassification {
	constructor(bounds, probability, label) {
		this.bounds = {
			"x1": bounds[0],
			"y1": bounds[1],
			"x2": bounds[2],
			"y2": bounds[3]
		};
		this.probability = probability;
		this.label = label;
	}
}

// Function to generate overlay/output image
const generateOverlayImage = async (imageData, classificationData) => {
	// Import image data `fs.readFile` into a sharp instance
	const image = sharp(imageData);
	// Get metadata for image (width & height)
	const metadata = await image.metadata();
	// Filter classification data to only include predictions that meet the probability threshold and map through each
	const compositeArray = classificationData.filter((item) => item.probability >= probabilityThreshold).map((item) => {
		// Get bounds for the prediction
		const bounds = item.bounds;

		// Get left, top, height and width of bounding box
		const left = Math.round(bounds.x1 * metadata.width);
		const top = Math.round(bounds.y1 * metadata.height);
		const height = Math.round(Math.abs(top - (bounds.y2 * metadata.height)));
		const width = Math.round(Math.abs(left - (bounds.x2 * metadata.width)));

		// Output sharp compatible object to pass into composite function
		return {
			"input": {
				"create": {
					width,
					height,
					"channels": 4,
					// Use background color from LabelColors dictionary defined above for the given label, and fall back to DEFAULT if label can't be found
					"background": LabelColors[item.label] || LabelColors.DEFAULT
				}
			},
			top,
			left
		}
	});

	const finalImage = await image.composite(compositeArray).toBuffer();
	return finalImage;
};