// ในไฟล์ services/jwt_wrapper.go
package services

import (
   "time"
   "github.com/dgrijalva/jwt-go"
   "errors"
   "fmt"
)

type JwtWrapper struct {
   SecretKey       string
   Issuer          string
   ExpirationHours int64
}

// JwtClaim เพิ่ม role และ id ใน claim ของ jwt
type JwtClaim struct {
   ID    uint   `json:"id"`    // เพิ่ม ID สำหรับเก็บ userID
   Email string `json:"email"`
   Role  string `json:"role"`
   jwt.StandardClaims
}

// GenerateToken generates a jwt token
func (j *JwtWrapper) GenerateToken(email, role string, id uint) (signedToken string, err error) {
    // พิมพ์ SecretKey ในการเซ็น
    fmt.Println("Generating token with SecretKey:", j.SecretKey)
    
    claims := &JwtClaim{
        Email: email,
        Role:  role,
        ID:    id, // เพิ่ม ID ใน claims
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(j.ExpirationHours)).Unix(),
            Issuer:    j.Issuer,
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    signedToken, err = token.SignedString([]byte(j.SecretKey))
    if err != nil {
        return
    }
    return
}


// ValidateToken validates the jwt token
func (j *JwtWrapper) ValidateToken(signedToken string) (claims *JwtClaim, err error) {
    // พิมพ์ SecretKey ในการตรวจสอบ
    fmt.Println("Validating token with SecretKey:", j.SecretKey)

    token, err := jwt.ParseWithClaims(
        signedToken,
        &JwtClaim{},
        func(token *jwt.Token) (interface{}, error) {
            return []byte(j.SecretKey), nil
        },
    )
    if err != nil {
        return
    }

    claims, ok := token.Claims.(*JwtClaim)
    if !ok {
        err = errors.New("Couldn't parse claims")
        return
    }

    if claims.ExpiresAt < time.Now().Local().Unix() {
        err = errors.New("JWT is expired")
        return
    }
    return
}
