const fs = require('fs');

// Function to generate a random date within a specified range

let i = 0
// Read the JSON data
fs.readFile('USERS.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Parse the JSON data
    let jsonData = JSON.parse(data);

    // Add a random date to each entry
    jsonData = jsonData.map(entry => {
         // Random date from 2020 to now
         i++
        return { ...entry, image: `https://picsum.photos/id/${i}/200/200` };
    });

    // Write the updated data back to the file
    fs.writeFile('MOCK_DATA2.json', JSON.stringify(jsonData, null, 2), err => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('Random dates added successfully!');
    });
});
