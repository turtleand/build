from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

# Generate keys
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)

public_key = private_key.public_key()

# Generate a second pair for the failing scenario
private_key_2 = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)

message = b"Login challenge: 938472"

signature = private_key.sign(
    message,
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH,
    ),
    hashes.SHA256(),
)

# The verification is successful for the first scenario

from cryptography.exceptions import InvalidSignature

try:
    public_key.verify(
        signature,
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH,
        ),
        hashes.SHA256(),
    )
    print("Signature is VALID")
except InvalidSignature:
    print("Signature is INVALID")


# Naturally, the verification fails when the signature is generated with a different private key
# than the expected by the stored public key in the server

signature_2 = private_key_2.sign(
    message,
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH,
    ),
    hashes.SHA256(),
)

try:
    public_key.verify(
        signature_2,
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH,
        ),
        hashes.SHA256(),
    )
    print("Signature is VALID")
except InvalidSignature:
    print("Signature is INVALID")
