/*
* ZPI API implementation of the Assistant class
* This class handles communication with the ZPI API endpoints
* for various AI models like gpt-4o, gpt-4o-mini, grok-beta, etc.
*/

export class Assistant {
#model;
#modelsList = [];
#testedModels = {};
// ZPI API endpoint for AI models
#baseURL = "https://api.zpi.my.id/v1/ai";

/**
* Create a new Assistant instance
* @param {string} model - The default model to use
*/
constructor(model = "gpt-4o-mini") {
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
        id: "gpt-4o",
        provider: "OpenAI",
        active: true,
        tested: this.#testedModels["gpt-4o"] !== undefined ? this.#testedModels["gpt-4o"] : true
    },
    {
        id: "gpt-4o-mini",
        provider: "OpenAI",
        active: true,
        tested: this.#testedModels["gpt-4o-mini"] !== undefined ? this.#testedModels["gpt-4o-mini"] : true
    },
    {
        id: "grok-beta",
        provider: "xAI",
        active: true,
        tested: this.#testedModels["grok-beta"] !== undefined ? this.#testedModels["grok-beta"] : true
    },
    {
        id: "grok-2",
        provider: "xAI",
        active: true,
        tested: this.#testedModels["grok-2"] !== undefined ? this.#testedModels["grok-2"] : true
    },
    {
        id: "grok-2-mini",
        provider: "xAI",
        active: true,
        tested: this.#testedModels["grok-2-mini"] !== undefined ? this.#testedModels["grok-2-mini"] : true
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
* @param {Array} history - Previous conversation history
* @returns {Promise<string>} The AI response
*/
async chat(content, history) {
    try {
    // Check if the current model is active
    const isActive = await this.isCurrentModelActive();
    if (!isActive) {
        return `I'm sorry, the model ${this.#model} is currently unavailable. Please try a different model.`;
    }

    // Prepare the messages in the format the API expects
    const messages = [
        {"role":"system","content":"Nama Anda adalah Zaileys AI"},
        ...history.map(msg => ({
        "role": msg.role,
        "content": msg.content
        })),
        {"role":"user","content":content}
    ];

    // Prepare the request
    const headersList = {"Accept":"application/json"};
    const payload = {"messages":messages};
    const requestOptions = {method:"POST",headers:headersList,body:JSON.stringify(payload)};

    // Send the request to the appropriate endpoint
    const endpoint = `${this.#baseURL}/${this.#model}`;
    const response = await fetch(endpoint, requestOptions);
    
    // If the request was successful, mark the model as active
    if (response.ok) {
        this.#testedModels[this.#model] = true;
        this.#updateModelStatus(this.#model, true);
    } else {
        this.#testedModels[this.#model] = false;
        this.#updateModelStatus(this.#model, false);
        return `I'm sorry, there was an error communicating with the model "${this.#model}". Please try a different model.`;
    }

    const data = await response.json();
    
    // Extract the response content based on ZPI API format
    return data.data?.choices?.content || data.message || data.choices?.[0]?.message?.content || "No response content";
    } catch (error) {
    console.error("Chat error:", error);
    this.#testedModels[this.#model] = false;
    this.#updateModelStatus(this.#model, false);
    return "Sorry, I couldn't process your request. The model may be temporarily unavailable.";
    }
}

/**
* Chat with the AI model and stream the response
* @param {string} content - The user message
* @param {Array} history - Previous conversation history
* @param {Function} onChunk - Callback for each chunk of the response
* @returns {Promise<string>} The complete AI response
*/
async *chatStream(content, history) {
    try {
        // Check if the current model is active
        const isActive = await this.isCurrentModelActive();
        if (!isActive) {
            yield `I'm sorry, the model "${this.#model}" is currently unavailable. Please try a different model.`;
            return;
        }

        // Prepare the messages in the format the API expects
        // Prepare the messages in the format the API expects
        const messages = [
            { role: "system", content: "responde a los mensajes como asistente" },
            ...history.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: "user", content }
        ];
        // Prepare the request with streaming enabled
        const headersList = { 
            "Accept": "application/json" 
        };
        const payload = { 
            messages,
            stream: true 
        };
        const requestOptions = { 
            method: "POST", 
            headers: headersList, 
            body: JSON.stringify(payload) 
        };

        // Send the request to the appropriate endpoint
        const endpoint = `${this.#baseURL}/${this.#model}`;
        
        // Use async/await for fetch, not yield
        const response = await fetch(endpoint, requestOptions);

        // If the request was successful, mark the model as active
        if (response.ok) {
            this.#testedModels[this.#model] = true;
            this.#updateModelStatus(this.#model, true);
        } else {
            this.#testedModels[this.#model] = false;
            this.#updateModelStatus(this.#model, false);
            yield `I'm sorry, there was an error communicating with the model "${this.#model}". Please try a different model.`;
            return;
        }

        // If the API doesn't support streaming, fallback to non-streaming
        if (!response.headers.get("content-type")?.includes("text/event-stream")) {
            const data = await response.json();
            const responseText = data.data?.choices?.content || data.message || data.choices?.[0]?.message?.content || "No response content";
            yield responseText;
            return;
        }

        // Process the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            // Use await for reader.read(), not yield
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            
            // Parse the SSE format
            const lines = chunk.split("\n");
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    if (data === "[DONE]") continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        // Check multiple possible locations for content
                        // Check multiple possible locations for content using ZPI API format
                        const content = 
                            parsed.data?.choices?.content || 
                            parsed.choices?.content ||
                            parsed.choices?.[0]?.delta?.content || 
                            parsed.choices?.[0]?.message?.content || 
                            parsed.delta?.content ||
                            parsed.message?.content ||
                            "";
                        yield content;
                    } catch (e) {
                        console.error("Error parsing SSE response:", e);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Chat stream error:", error);
        this.#testedModels[this.#model] = false;
        this.#updateModelStatus(this.#model, false);
        const errorMsg = "Sorry, I couldn't process your streaming request. The model may be temporarily unavailable.";
        yield errorMsg;
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
    
    const headersList = { "Accept": "application/json" };
    const payload = { 
        messages: [
            { role: "system", content: "Nama Anda adalah Zaileys AI" },
            { role: "user", content: "Hello, this is a test message." }
        ]
    };
    const requestOptions = { 
        method: "POST", 
        headers: headersList, 
        body: JSON.stringify(payload) 
    };

    const endpoint = `${this.#baseURL}/${modelId}`;
    const response = await fetch(endpoint, requestOptions);
    
    this.#testedModels[modelId] = response.ok;
    this.#updateModelStatus(modelId, response.ok);
    
    this.#model = originalModel;
    return response.ok;
    } catch (error) {
    console.error(`Error testing model ${modelId}:`, error);
    this.#testedModels[modelId] = false;
    this.#updateModelStatus(modelId, false);
    return false;
    }
};
}
