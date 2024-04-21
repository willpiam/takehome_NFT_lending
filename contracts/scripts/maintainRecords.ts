
import { promises as fs } from 'fs';

const addRecord = async (record: any) => {
  const filename = 'records.json';
  
  // Custom replacer function for JSON.stringify to handle BigInt
  const replacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString(); // Append 'n' to distinguish it as a BigInt
    }
    return value;
  };

  try {
    // Open or create "records.json" file and read its content
    let fileContent: any[] = [];
    try {
      const data = await fs.readFile(filename, { encoding: 'utf8' });
      fileContent = JSON.parse(data, (key, value) => {
        // Custom reviver for parsing, converting strings that look like BigInt back to BigInt
        // if (typeof value === 'string' && /^\d+n$/.test(value)) {
        //   return BigInt(value);
        // }
        return value;
      });
    } catch (error : any) {
      // If file does not exist, start with an empty array
      if (error.code === 'ENOENT') {
        fileContent = [];
      } else {
        throw error;
      }
    }

    // Ensure it's an array of objects
    if (!Array.isArray(fileContent)) {
      throw new Error('File content is not an array');
    }

    // Append current time to the object in human-readable format
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    record.timestamp = formattedTime;

    // Append the new object to the array
    fileContent.push(record);

    // Write updated array back to the file
    await fs.writeFile(filename, JSON.stringify(fileContent, replacer, 2), { encoding: 'utf8' });

    // File automatically closes after writeFile, so no need to explicitly close it

    console.log('Record added successfully');
  } catch (error) {
    console.error('Failed to add record:', error);
  }
};



export { addRecord };