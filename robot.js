const robotVacuum = class {
    constructor(roomDimensions, startingLocation, dirtLocations, vacuumInstructions) {
        // initialize X_MAX and Y_MAX
        this.X_MAX = roomDimensions[0];
        this.Y_MAX = roomDimensions[1];
        // initialize dirt locations
        this.dirtLocations = dirtLocations;
        // initialize starting & current location
        this.startingLocation = startingLocation;
        this.currentLocation = startingLocation;
        // initialize vacuum instructions
        this.vacuumInstructions = vacuumInstructions.toUpperCase();
        // initialize dirt count = 0
        this.dirtCount = 0;

        // used for visualization
        this.locationHistory = [];
        this.originalDirtLocations = [...dirtLocations];
    }

    validateData() {
        let valid = true;
        let error = '';

        if (this.Y_MAX < 1) {
            error += 'Y in (X,Y) Room Dimension must be greater than 1. (Line 1)\n';
            valid = false;
        }
        if (this.X_MAX < 1) {
            error += 'X in (X,Y) Room Dimension must be greater than 1. (Line 1)\n';
            valid = false;
        }
        if (this.startingLocation[0] > this.X_MAX || this.startingLocation[1] > this.Y_MAX) {
            error += 'Starting location must exist in Room Dimensions. (Line 2)\n';
            valid = false;
        }
        if (RegExp('[^NWSE]').test(this.vacuumInstructions)) {
            error += 'Directions must only have N, S, W, or E. (Last Line)\n';
            valid = false;
        }
        return { valid, error };
    }

    isValidMove(direction) {
        switch (direction) {
            case 'N':
                return this.currentLocation[1] + 1 < this.Y_MAX;
            case 'S':
                return this.currentLocation[1] - 1 >= 0;
            case 'E':
                return this.currentLocation[0] + 1 < this.X_MAX;
            case 'W':
                return this.currentLocation[0] - 1 >= 0;
            default:
                return null;
        }
    }

    move(direction) {
        switch (direction) {
            case 'N':
                this.currentLocation[1] += 1;
                return this.currentLocation;
            case 'S':
                this.currentLocation[1] -= 1;
                return this.currentLocation;
            case 'E':
                this.currentLocation[0] += 1;
                return this.currentLocation;
            case 'W':
                this.currentLocation[0] -= 1;
                return this.currentLocation;
        }
    }

    isOnDirt() {
        for (let dirtLocation of this.dirtLocations) {
            if (dirtLocation[0] == this.currentLocation[0] && dirtLocation[1] == this.currentLocation[1]) {
                return this.dirtLocations.indexOf(dirtLocation);
            }
        }
        return -1;
    }

    vacuumDirt(dirtIndex) {
        this.dirtLocations.splice(dirtIndex, 1);
        this.dirtCount += 1;
    }

    start() {
        // get starting location - used for visualization 
        this.locationHistory.push([...this.currentLocation]);

        // clear output element
        document.querySelector('#output').innerText = '';

        // check to see if the robot starts on a dirt patch. if so, vacuum the dirt and increment the counter.
        const startingDirtIndex = this.isOnDirt();
        if (startingDirtIndex > -1) {
            this.vacuumDirt(dirtIndex);
        }

        // loop through the input instruction set
        for (let direction of this.vacuumInstructions.split('')) {
            // check to see if the moving in the specified direction is valid. if so, move and check for dirt.
            if (this.isValidMove(direction)) {
                this.move(direction);
                // check if new position is on a dirt patch. if so, vacuum the dirt and increment the counter.
                const dirtIndex = this.isOnDirt();
                if (dirtIndex > -1) {
                    this.vacuumDirt(dirtIndex);
                }
                // get each current location - used for visualization 
                this.locationHistory.push([...this.currentLocation]);
            }
        }

        // required output for project 
        console.log(`${this.currentLocation[0]} ${this.currentLocation[1]}\n${this.dirtCount}`);
        document.querySelector('#output').innerText = `${this.currentLocation[0]} ${this.currentLocation[1]}\n${this.dirtCount}`;

        // visualization
        this.render();
    }


    // methods below used to render the visualization

    render() {
        document.querySelector('#render').innerHTML = '';
        this.createTable();
        this.renderDirt();
        this.renderLocations();
    }

    createTable() {
        const renderElement = document.querySelector('#render');

        for (let y = 0; y < this.Y_MAX; y++) {
            // create rows
            const row = renderElement.insertRow(y);

            for (let x = 0; x < this.X_MAX; x++) {
                // create columns
                const cell = row.insertCell(x);
            }
        }
    }

    renderDirt() {
        const renderElement = document.querySelector('#render');

        for (let index = 0; index < this.originalDirtLocations.length; index++) {
            const location = this.originalDirtLocations[index];
            const row = renderElement.rows[this.Y_MAX - location[1] - 1];
            const cell = row.cells[location[0]];

            cell.style.backgroundColor = "brown";
        }
    }

    renderLocations() {
        const renderElement = document.querySelector('#render');

        let opacity = .1;

        const task = function (index) {
            setTimeout(function () {
                const location = this.locationHistory[index];
                const row = renderElement.rows[this.Y_MAX - location[1] - 1];
                const cell = row.cells[location[0]];

                if (index == 0) {
                    cell.style.backgroundColor = "green";
                    cell.innerHTML = location;
                } else if (index == this.locationHistory.length - 1) {
                    cell.style.backgroundColor = "red";
                    cell.innerHTML = location;
                } else {
                    cell.style.backgroundColor = `rgba(75,75,75,${opacity})`;
                    opacity += .03;
                }

            }.bind(this), 500 * index);
        }.bind(this)

        for (let index = 0; index < this.locationHistory.length; index++) {
            task(index);
        }
    }

}


// functions triggered from index.html

const parseInput = (input) => {
    let file = input.files[0];
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
        // get contents of file reader
        let inputArray = reader.result;

        const inputElement = document.querySelector('#instructions');
        inputElement.value = inputArray;

    };
}

const startRobot = () => {

    const inputElement = document.querySelector('#instructions');

    let inputArray = inputElement.value
    // split input by new line
    inputArray = inputArray.split('\n');

    // get room dimension (1st line)
    let roomDimensions = inputArray[0];
    // create an array of two values
    roomDimensions = roomDimensions.split(' ');
    // array of strings -> array of integers
    roomDimensions = roomDimensions.map(x => parseInt(x));

    // get starting location (2nd line)
    let startingLocation = inputArray[1];
    // create an array of two values
    startingLocation = startingLocation.split(' ');
    // array of strings -> array of integers
    startingLocation = startingLocation.map(x => parseInt(x));

    // get vacuum instructions (last line)
    const vacuumInstructions = inputArray[inputArray.length - 1];

    // get dirt locations by removing first 2 and last 1 indices from the array
    inputArray.splice(0, 2);
    inputArray.splice(-1, 1);
    let dirtLocations = inputArray;
    // create an array of two values for each element in dirtLocations
    dirtLocations = dirtLocations.map(x => x.split(' '));
    // array of strings -> array of integers
    dirtLocations = dirtLocations.map(x => x.map(x => +x));

    // set window variable robot equal to robotVacuum object
    window.robot = new robotVacuum(roomDimensions, startingLocation, dirtLocations, vacuumInstructions);

    const validation = window.robot.validateData();

    if (validation.valid) {
        window.robot.start();
    } else {
        const error = validation.error;
        document.querySelector('#output').innerText = error;
    }
}

