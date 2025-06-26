import bcrypt from "bcrypt"

async function main() {
  const plainPassword = "123456" // 👉 Troque pela senha que quiser
  const hash = await bcrypt.hash(plainPassword, 10)

  console.log("Senha:", plainPassword)
  console.log("Hash gerado:", hash)
}

main().catch(console.error)
