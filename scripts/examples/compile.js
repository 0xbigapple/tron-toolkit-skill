const solc = require('solc');

const sourceCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AppleToken {
    string public name = "AppleToken";
    string public symbol = "APPLE";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Allowance exceeded");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
`;

const input = {
    language: 'Solidity',
    sources: {
        'AppleToken.sol': {
            content: sourceCode
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode.object']
            }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if(output.errors) {
    output.errors.forEach(err => console.error(err.formattedMessage));
}

const contract = output.contracts['AppleToken.sol']['AppleToken'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

console.log(JSON.stringify({abi, bytecode}));
