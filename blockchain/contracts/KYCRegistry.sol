// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract KYCRegistry {
    enum Status {
        ACTIVE,
        REVOKED
    }

    struct CredentialRecord {
        bytes32 credentialHash;
        address issuer;
        uint256 issuedAt;
        Status status;
    }

    mapping(bytes32 => CredentialRecord) private credentials;

    event CredentialRegistered(
        bytes32 indexed credentialId,
        bytes32 credentialHash,
        address indexed issuer,
        uint256 issuedAt
    );

    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        uint256 revokedAt
    );

    function registerCredential(
        bytes32 credentialId,
        bytes32 credentialHash,
        address issuer
    ) external {
        require(
            credentials[credentialId].issuedAt == 0,
            "Credential already registered"
        );

        credentials[credentialId] = CredentialRecord({
            credentialHash: credentialHash,
            issuer: issuer,
            issuedAt: block.timestamp,
            status: Status.ACTIVE
        });

        emit CredentialRegistered(
            credentialId,
            credentialHash,
            issuer,
            block.timestamp
        );
    }

    function verifyCredential(
        bytes32 credentialId
    )
        external
        view
        returns (
            bytes32 credentialHash,
            address issuer,
            uint256 issuedAt,
            Status status
        )
    {
        CredentialRecord memory credential = credentials[credentialId];

        return (
            credential.credentialHash,
            credential.issuer,
            credential.issuedAt,
            credential.status
        );
    }

    function revokeCredential(bytes32 credentialId) external {
        CredentialRecord storage credential = credentials[credentialId];

        require(
            credential.issuedAt != 0,
            "Credential not registered"
        );

        require(
            msg.sender == credential.issuer,
            "Only issuer can revoke"
        );

        require(
            credential.status == Status.ACTIVE,
            "Credential already revoked"
        );

        credential.status = Status.REVOKED;

        emit CredentialRevoked(
            credentialId,
            msg.sender,
            block.timestamp
        );
    }
}