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
    // ตั้งค่าอายุ token เป็น 2 ชั่วโมง
    j.ExpirationHours = 2

    fmt.Println("Generating token with SecretKey:", j.SecretKey)
    
    claims := &JwtClaim{
        Email: email,
        Role:  role,
        ID:    id,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: time.Now().Add(time.Duration(j.ExpirationHours) * time.Hour).Unix(),
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
    fmt.Println("Validating token with SecretKey:", j.SecretKey)
    token, err := jwt.ParseWithClaims(
        signedToken,
        &JwtClaim{},
        func(token *jwt.Token) (interface{}, error) {
            return []byte(j.SecretKey), nil
        },
    )

    // 1️⃣ ตรวจสอบ error จาก parsing
    if err != nil {
        return nil, fmt.Errorf("invalid token: %w", err)
    }

    // 2️⃣ ตรวจสอบ claims type และ validity
    claims, ok := token.Claims.(*JwtClaim)
    if !ok {
        return nil, errors.New("couldn't parse claims")
    }

    if !token.Valid {
        return nil, errors.New("invalid token")
    }

    // 3️⃣ ตรวจสอบว่า token หมดอายุหรือยัง
    if claims.ExpiresAt < time.Now().Unix() {
        return nil, errors.New("JWT is expired")
    }

    return claims, nil
}
