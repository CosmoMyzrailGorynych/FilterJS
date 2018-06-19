var colorInput = <BlockTemplate>{
    nameLoc: 'blocks.inputs.colorInput.name',
    name: 'Color Input',
    noPreview: true,
    tags: [{
        tag: 'color-picker',
        key: 'color',
        defaultValue: '#000000'
    }],
    inputs: [],
    outputs: [{
        key: 'color',
        type: 'color',
        name: 'Color',
        nameLoc: 'blocks.inputs.colorInput.outputColor',
    }],
    exec(inputs, block) {
        return Promise.resolve({
            color: block.tagValues.color
        });
    }
};

var numberInput = <BlockTemplate>{
    nameLoc: 'blocks.inputs.numberInput.name',
    name: 'Number Input',
    noPreview: true,
    tags: [{
        tag: 'number-input',
        key: 'number',
        defaultValue: 0
    }],
    inputs: [],
    outputs: [{
        key: 'number',
        type: 'number',
        name: 'Number',
        nameLoc: 'blocks.inputs.numberInput.outputNumber',
    }],
    exec(inputs, block) {
        return Promise.resolve({
            number: block.tagValues.number
        });
    }
};

var boolInput = <BlockTemplate>{
    nameLoc: 'blocks.inputs.boolInput.name',
    name: 'Boolean Input',
    noPreview: true,
    tags: [{
        tag: 'bool-input',
        key: 'bool',
        defaultValue: false
    }],
    inputs: [],
    outputs: [{
        key: 'bool',
        type: 'bool',
        name: 'outputBoolean',
        nameLoc: 'blocks.inputs.boolInput.outputBoolean',
    }],
    exec(inputs, block) {
        return Promise.resolve({
            bool: block.tagValues.bool
        });
    }
};

module.exports = {
    colorInput,
    numberInput,
    boolInput
};
