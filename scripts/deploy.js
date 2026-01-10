async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy Token
  const Token = await ethers.getContractFactory("ApolloToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("ApolloToken deployed to:", token.target);

  // Deploy Faucet
  const Faucet = await ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(token.target);
  await faucet.waitForDeployment();
  console.log("TokenFaucet deployed to:", faucet.target);

  // Mint thêm token và chuyển vào faucet (ví dụ 10.000 APT)
  await token.mint(deployer.address, ethers.parseEther("10000"));
  await token.transfer(faucet.target, ethers.parseEther("10000"));
  console.log("Funded faucet with 10,000 APT");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
