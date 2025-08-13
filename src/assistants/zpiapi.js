/*
* Meee API implementation of the Assistant class
* This class handles communication with the Meee API endpoint
* for AI model a4
*/

import { API_CONFIG } from '../config/api.js';

/**
 * Simple chat function using GET request to Meee API
 * @param {string} prompt - The message to send
 * @param {string} model - The model to use (default: 'a4')
 * @returns {Promise<string>} The AI response
 */
export async function chatGET(prompt, model = 'a4') {
    // Use secure proxy server - API key is hidden on the server
    const url = `${API_CONFIG.MEEE_API_URL}/${model}/${encodeURIComponent(prompt)}`;
    console.log("ChatGET URL:", url);
    console.log("Model being used:", model);

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        }
    });

    console.log("Response status:", res.status);
    console.log("Response ok:", res.ok);

    if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response body:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const responseText = await res.text();
    console.log("Response text:", responseText);
    return responseText;
}

// Test function to verify the API works
export async function testAPI() {
    try {
        console.log("Testing API...");
        const result = await chatGET("Hola");
        console.log("Test successful:", result);
        return result;
    } catch (error) {
        console.error("Test failed:", error);
        throw error;
    }
}

export class Assistant {
    #model;
    #modelsList = [];
    #testedModels = {};
    // Meee API endpoint
    #baseURL = API_CONFIG.MEEE_API_URL;
    #apiKey = API_CONFIG.MEEE_API_KEY;

    /**
    * Create a new Assistant instance
    * @param {string} model - The default model to use
    */
    constructor(model = "a4") {
        this.#model = model;
    }

    /**
    * Get the current model
    * @returns {string} The current model ID
    */
    getModel() {
        return this.#model;
    }

    /**
    * Set a new model
    * @param {string} model - The model ID to set
    */
    setModel(model) {
        this.#model = model;
    }

    /**
    * Get a list of available models
    * @returns {Promise<Array>} Array of model objects
    */
    async getAvailableModels() {
        const models = [
            {
                id: "a4",
                provider: "Meee API",
                active: true,
                tested: this.#testedModels["a4"] !== undefined ? this.#testedModels["a4"] : true
            }
        ];

        this.#modelsList = models;
        return this.#modelsList;
    }

    /**
    * Check if the current model is active
    * @returns {Promise<boolean>} Whether the model is active
    */
    async isCurrentModelActive() {
        try {
            const models = await this.getAvailableModels();
            const model = models.find(m => m.id === this.#model);
            return model?.active ?? false;
        } catch (error) {
            console.error("Error checking if model is active:", error);
            return false;
        }
    }

    /**
    * Update the status of a model
    * @param {string} modelId - The model ID to update
    * @param {boolean} isActive - Whether the model is active
    */
    #updateModelStatus(modelId, isActive) {
        this.#testedModels[modelId] = isActive;
        const modelIndex = this.#modelsList.findIndex(m => m.id === modelId);
        if (modelIndex !== -1) {
            this.#modelsList[modelIndex].active = isActive;
            this.#modelsList[modelIndex].tested = true;
        }
    }



    /**
    * Chat with the AI model
    * @param {string} content - The user message
    * @param {Array} history - Previous conversation history (not used in current API)
    * @returns {Promise<string>} The AI response
    */
    async chat(content, history) {
        try {
            // Check if the current model is active
            const isActive = await this.isCurrentModelActive();
            if (!isActive) {
                return `I'm sorry, the model ${this.#model} is currently unavailable. Please try a different model.`;
            }

            // Use the chatGET function
            const response = await chatGET(content, this.#model);

            // Mark the model as active since the request succeeded
            this.#testedModels[this.#model] = true;
            this.#updateModelStatus(this.#model, true);

            return response || "No response content";
        } catch (error) {
            console.error("Chat error:", error);
            this.#testedModels[this.#model] = false;
            this.#updateModelStatus(this.#model, false);

            if (error.message.includes('HTTP')) {
                return `I'm sorry, there was an error communicating with the model "${this.#model}". Please try a different model.`;
            }
            return "Sorry, I couldn't process your request. The model may be temporarily unavailable.";
        }
    }

    /**
    * Chat with the AI model and stream the response
    * @param {string} content - The user message
    * @param {Array} history - Previous conversation history (not used in current API)
    * @param {Function} onChunk - Callback for each chunk of the response
    * @returns {Promise<string>} The complete AI response
    */
    async *chatStream(content, history) {
        try {
            console.log("ChatStream started with content:", content, "model:", this.#model);

            // Check if the current model is active
            const isActive = await this.isCurrentModelActive();
            console.log("Model active status:", isActive);

            if (!isActive) {
                yield `I'm sorry, the model "${this.#model}" is currently unavailable. Please try a different model.`;
                return;
            }

            console.log("Calling chatGET with:", content, this.#model);

            // Use the chatGET function and simulate streaming
            const response = await chatGET(content, this.#model);

            console.log("ChatGET response:", response);

            // Mark the model as active since the request succeeded
            this.#testedModels[this.#model] = true;
            this.#updateModelStatus(this.#model, true);

            // Since this API doesn't support streaming, yield the complete response
            if (response) {
                yield response;
            } else {
                yield "No response content";
            }
        } catch (error) {
            console.error("Chat stream error details:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);

            this.#testedModels[this.#model] = false;
            this.#updateModelStatus(this.#model, false);

            if (error.message.includes('HTTP')) {
                yield `I'm sorry, there was an error communicating with the model "${this.#model}". Error: ${error.message}`;
            } else {
                yield `Sorry, I couldn't process your streaming request. Error: ${error.message}`;
            }
        }
    }

    /**
    * Test a model to see if it's available
    * @param {string} modelId - The model ID to test
    * @returns {Promise<boolean>} Whether the model is available
    */
    testModel = async (modelId) => {
        try {
            const originalModel = this.#model;
            this.#model = modelId;

            // Test with a simple message using the chatGET function
            await chatGET("Hello, this is a test message.", modelId);

            this.#testedModels[modelId] = true;
            this.#updateModelStatus(modelId, true);

            this.#model = originalModel;
            return true;
        } catch (error) {
            console.error(`Error testing model ${modelId}:`, error);
            this.#testedModels[modelId] = false;
            this.#updateModelStatus(modelId, false);
            this.#model = originalModel;
            return false;
        }
    };
}
