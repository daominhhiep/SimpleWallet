// Khai báo phiên bản Solidity
pragma solidity ^0.8.0;

// Khai báo smart contract
contract SimpleWallet {
    // Biến lưu trữ số dư
    mapping(address => uint256) public balances;

    // Hàm nạp Ether
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // Hàm rút Ether
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    // Hàm xem số dư
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}
