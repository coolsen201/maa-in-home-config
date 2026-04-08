package shared

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

// GetFirestoreClient initializes and returns a Firestore client authenticated via FIREBASE_SERVICE_ACCOUNT.
func GetFirestoreClient(ctx context.Context) (*firestore.Client, error) {
	serviceAccountJSON := os.Getenv("FIREBASE_SERVICE_ACCOUNT")
	if serviceAccountJSON == "" {
		return nil, fmt.Errorf("FIREBASE_SERVICE_ACCOUNT environment variable is not set")
	}

	// Validate JSON format
	if !json.Valid([]byte(serviceAccountJSON)) {
		return nil, fmt.Errorf("FIREBASE_SERVICE_ACCOUNT is not valid JSON")
	}

	opt := option.WithCredentialsJSON([]byte(serviceAccountJSON))
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %v", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting firestore client: %v", err)
	}

	return client, nil
}
