from vyper.interfaces import ERC20

implements: ERC20

depositTime: public(HashMap[address, uint256])
balances: HashMap[address, uint256]
allowances: HashMap[address, HashMap[address, uint256]]
total_supply: public(uint256)

event Transfer:
    sender: indexed(address)
    receiver: indexed(address)
    value: uint256

event Approval:
    owner: indexed(address)
    spender: indexed(address)
    value: uint256

event Mint:
    to: indexed(address)
    value: uint256

event Withdrawn:  # Define the Withdrawn event
    withdrawer: indexed(address)
    value: uint256

@internal
def _mint(_to: address, _value: uint256):
    self.total_supply += _value
    self.balances[_to] += _value
    log Transfer(ZERO_ADDRESS, _to, _value)
    log Mint(_to, _value)  # Emitting a custom event with the minted tokens value


@internal
def _transfer(_from: address, _to: address, _value: uint256):
    assert self.balances[_from] >= _value, "Insufficient balance"
    self.balances[_from] -= _value
    self.balances[_to] += _value
    log Transfer(_from, _to, _value)

@payable
@external
def deposit():
    assert msg.value == 1, "Must deposit exactly 1 wei"
    assert self.depositTime[msg.sender] == 0, "Already deposited from this wallet address"
    self.depositTime[msg.sender] = block.timestamp

@external
def withdraw() -> bool:
    assert self.depositTime[msg.sender] != 0, "User did not deposit at any point"
    lockedTime: uint256 = block.timestamp - self.depositTime[msg.sender]
    self._mint(msg.sender, lockedTime)
    self.depositTime[msg.sender] = 0
    send(msg.sender, 1)
    log Transfer(ZERO_ADDRESS, msg.sender, lockedTime)  # Emitting a Transfer event to indicate the minted tokens
    log Withdrawn(msg.sender, lockedTime)  # Emitting the Withdrawn event
    return True


@external
def totalSupply() -> uint256:
    return self.total_supply

@external
def balanceOf(_owner: address) -> uint256:
    return self.balances[_owner]

@external
def allowance(_owner: address, _spender: address) -> uint256:
    return self.allowances[_owner][_spender]

@external
def transfer(_to: address, _value: uint256) -> bool:
    self._transfer(msg.sender, _to, _value)
    return True

@external
def approve(_spender: address, _value: uint256) -> bool:
    self.allowances[msg.sender][_spender] = _value
    log Approval(msg.sender, _spender, _value)
    return True

@external
def transferFrom(_from: address, _to: address, _value: uint256) -> bool:
    self._transfer(_from, _to, _value)
    self.allowances[_from][msg.sender] -= _value
    return True
